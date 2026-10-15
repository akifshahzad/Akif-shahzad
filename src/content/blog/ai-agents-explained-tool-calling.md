"AI agent" has become one of those terms that means everything and nothing. Under the hood, most AI agents are built on one simple mechanism: tool calling. In this post I'll explain how tool calling actually works, walk through a complete small agent in Python, and talk honestly about guardrails and when you shouldn't build an agent at all.

## Chatbot vs agent: what's the difference?

A **chatbot** takes text in and gives text out. It can only use what's in its training data and its prompt.

An **agent** can decide to *take actions* — look something up, call an API, run a calculation — look at the result, and decide what to do next. It keeps going in a loop until it has enough to answer or it's done the task.

| | Chatbot | Agent |
|---|---|---|
| Output | Text | Text and actions |
| Access to live data | Only what you put in the prompt | Whatever its tools can reach |
| Number of model calls | Usually one per message | Several, in a loop |
| Predictability | High | Lower — the model chooses the steps |
| Main risk | Wrong answers | Wrong answers *and* wrong actions |

The important thing to understand: **the model never runs your code**. It only *asks* for a tool to be called. Your program decides whether to run it, runs it, and sends the result back.

## How tool calling works

The flow looks like this:

1. You send the model the user's message plus a list of **tool definitions** (name, description, input schema).
2. The model either answers directly or responds with a **tool use request**: "call `get_weather` with `{"city": "Lahore"}`."
3. Your code runs the tool and sends the result back as a **tool result**.
4. The model reads the result and either requests another tool or gives the final answer.

Steps 2–4 repeat. That repetition is "the agent loop."

## Defining tools

A tool definition is just a name, a description, and a JSON Schema for the input:

```python
TOOLS = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a city. Use this whenever the user asks about weather conditions.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name, e.g. 'Lahore'"},
            },
            "required": ["city"],
        },
    },
    {
        "name": "calculator",
        "description": "Evaluate a basic arithmetic expression with + - * / and parentheses. Use this for any math instead of calculating in your head.",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {"type": "string", "description": "e.g. '(31 - 4) * 1.8 + 32'"},
            },
            "required": ["expression"],
        },
    },
]
```

The **description is the most important part**. The model decides which tool to use based almost entirely on the name and description, so write them like documentation for a new teammate: what it does, when to use it, and what the inputs mean.

## A complete agent in Python

Here's a full working example. The weather tool is a mock so you can run it without another API key; in a real project it would call a weather API.

```python
# agent.py
import ast
import json
import operator

import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment

SYSTEM = "You are a helpful assistant. Use the tools when they help. Be concise."

# --- Tool implementations -------------------------------------------------

FAKE_WEATHER = {
    "lahore": {"temp_c": 31, "condition": "sunny"},
    "london": {"temp_c": 14, "condition": "light rain"},
}


def get_weather(city):
    data = FAKE_WEATHER.get(city.strip().lower())
    if data is None:
        return json.dumps({"error": f"No weather data for {city}"})
    return json.dumps({"city": city, **data})


OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.USub: operator.neg,
}


def calculator(expression):
    # Safe arithmetic evaluator -- never pass model output to eval()
    def ev(node):
        if isinstance(node, ast.Expression):
            return ev(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in OPS:
            return OPS[type(node.op)](ev(node.left), ev(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in OPS:
            return OPS[type(node.op)](ev(node.operand))
        raise ValueError("Unsupported expression")

    return str(ev(ast.parse(expression, mode="eval")))


TOOL_FUNCTIONS = {"get_weather": get_weather, "calculator": calculator}

# --- The agent loop -------------------------------------------------------


def run_agent(user_message, max_steps=8):
    messages = [{"role": "user", "content": user_message}]

    for _ in range(max_steps):
        response = client.messages.create(
            model="claude-opus-5-5",
            max_tokens=2048,
            system=SYSTEM,
            tools=TOOLS,
            messages=messages,
        )

        if response.stop_reason != "tool_use":
            return "".join(block.text for block in response.content if block.type == "text")

        messages.append({"role": "assistant", "content": response.content})

        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            print(f"-> {block.name}({block.input})")
            func = TOOL_FUNCTIONS.get(block.name)
            try:
                if func is None:
                    raise ValueError(f"Unknown tool: {block.name}")
                output = func(**block.input)
                is_error = False
            except Exception as exc:
                output = f"Error: {exc}"
                is_error = True
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": output,
                "is_error": is_error,
            })

        messages.append({"role": "user", "content": tool_results})

    return "Stopped: the agent hit the step limit without finishing."


if __name__ == "__main__":
    print(run_agent("What's the weather in Lahore, and what is that temperature in Fahrenheit?"))
```

(Put the `TOOLS` list from the previous section at the top of the same file.)

When you run it, you'll typically see the model call `get_weather`, then `calculator` with something like `31 * 9 / 5 + 32`, and then answer in plain text. The exact steps can vary between runs — that's the nature of letting the model plan.

### What's happening in the loop

- Every assistant response (including its tool requests) is appended to `messages`, so the model sees its own history.
- All tool results from one turn go back in **one** user message, each linked by `tool_use_id`. The model can request several tools at once, so always loop over every `tool_use` block.
- Errors are returned as tool results with `is_error`, not raised. This lets the model recover — for example, by trying a different city spelling.
- `max_steps` stops runaway loops. Never ship an agent without a step limit.

## Guardrails that matter

Agents fail differently from chatbots, because a bad decision can turn into a bad *action*. These are the guardrails I put in place:

- **Least privilege.** Give the agent only the tools it needs. A support agent doesn't need a `delete_user` tool.
- **Validate every input.** The JSON Schema is a hint, not a guarantee. Check types, ranges, and IDs in your tool code — and check that the current user is allowed to touch that resource.
- **Human confirmation for risky actions.** Sending emails, making payments, or deleting data should require a user to approve. Have the tool return "awaiting approval" rather than act immediately.
- **Never `eval` model output.** Notice the calculator parses an AST instead.
- **Step and cost limits.** Cap loop iterations and `max_tokens`, and log token usage per run.
- **Treat tool results as untrusted.** If a tool fetches web pages or user content, that content can contain instructions trying to hijack the agent (prompt injection). Don't let fetched content trigger sensitive tools without checks.
- **Log everything.** Store each tool call and result. When something goes wrong, the trace is the only way to understand why.

## When NOT to build an agent

Agents are fun to build, but they're often the wrong choice. Skip the agent if:

- **The steps are always the same.** If every request is "retrieve docs, then answer," write that as normal code. A fixed pipeline is cheaper, faster, and easier to test.
- **You need strict predictability or compliance.** A deterministic workflow with an LLM call at one step is easier to audit.
- **Latency matters a lot.** Each loop iteration is another model call.
- **A single well-designed prompt already works.** Don't add a loop to solve a problem you don't have.

My rule of thumb: start with a single call, then a fixed workflow, and only reach for an open-ended agent when the model genuinely needs to choose *which* steps to take.

## FAQ

### What is tool calling in LLMs?

Tool calling (also called function calling) lets a model respond with a structured request to call one of the functions you've described, instead of plain text. Your code runs the function and sends the result back, so the model can use live data or take actions.

### Does the AI run my functions directly?

No. The model only outputs the tool name and arguments. Your application decides whether and how to execute it, which is exactly where you put validation and permission checks.

### Do I need a framework like LangChain to build an AI agent?

No. The loop above is the core of most agent frameworks. Frameworks can help with tracing, memory and integrations, but writing the loop yourself first makes it much easier to debug later.

### What's the difference between an AI agent and a workflow?

In a workflow, *you* define the sequence of steps in code. In an agent, the *model* decides which steps to take and in what order. Workflows are more predictable; agents are more flexible.

## Key takeaways

- An agent is a model in a loop with tools; the model requests actions, your code performs them.
- Tool descriptions drive tool choice — write them carefully.
- Return errors as tool results, send all results back together, and always cap the loop.
- Guardrails (permissions, validation, confirmation, logging) matter more than clever prompts.
- If the steps are fixed, build a workflow instead.

If you're thinking about adding an agent to your product and want a second opinion on whether it's the right approach, [get in touch](/contact) — or see what I build on [my services](/services) page.
