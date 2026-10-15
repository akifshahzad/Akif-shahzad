import {
  FaHtml5, FaCss3Alt, FaReact, FaGitAlt, FaGithub, FaPython, FaFigma, FaNpm,
} from "react-icons/fa";
import {
  SiJavascript, SiTypescript, SiTailwindcss, SiBootstrap, SiVite, SiNextdotjs, SiRedux,
  SiNodedotjs, SiExpress, SiFastapi, SiDjango, SiFlask, SiGraphql, SiJsonwebtokens, SiSqlalchemy, SiSwagger,
  SiMysql, SiPostgresql, SiMongodb, SiRedis, SiPrisma, SiFirebase, SiSupabase,
  SiLangchain, SiHuggingface, SiPytorch, SiTensorflow, SiScikitlearn, SiPandas, SiNumpy,
  SiAnthropic, SiGooglegemini, SiOllama, SiStreamlit, SiJupyter,
  SiDocker, SiVercel, SiNetlify, SiGithubactions, SiLinux, SiPostman,
} from "react-icons/si";
import { LuBrainCircuit } from "react-icons/lu";
import { TbVectorTriangle } from "react-icons/tb";
import { VscVscode } from "react-icons/vsc";

// Levels are self-assessed — adjust them to match your own experience.
export const SKILL_GROUPS = [
  {
    id: "frontend",
    title: "Frontend",
    skills: [
      { name: "HTML5", icon: FaHtml5, level: 95 },
      { name: "CSS3", icon: FaCss3Alt, level: 92 },
      { name: "JavaScript (ES6+)", icon: SiJavascript, level: 92 },
      { name: "TypeScript", icon: SiTypescript, level: 75 },
      { name: "React.js", icon: FaReact, level: 90 },
      { name: "Next.js", icon: SiNextdotjs, level: 80 },
      { name: "Redux Toolkit", icon: SiRedux, level: 82 },
      { name: "Tailwind CSS", icon: SiTailwindcss, level: 90 },
      { name: "Bootstrap", icon: SiBootstrap, level: 88 },
      { name: "Vite", icon: SiVite, level: 88 },
    ],
  },
  {
    id: "backend",
    title: "Backend",
    skills: [
      { name: "Node.js", icon: SiNodedotjs, level: 80 },
      { name: "Express.js", icon: SiExpress, level: 78 },
      { name: "Python", icon: FaPython, level: 80 },
      { name: "FastAPI", icon: SiFastapi, level: 78 },
      { name: "Django", icon: SiDjango, level: 72 },
      { name: "Flask", icon: SiFlask, level: 75 },
      { name: "REST APIs", icon: SiPostman, level: 90 },
      { name: "JWT Authentication", icon: SiJsonwebtokens, level: 85 },
      { name: "SQLAlchemy", icon: SiSqlalchemy, level: 72 },
      { name: "Swagger / OpenAPI", icon: SiSwagger, level: 80 },
      { name: "GraphQL", icon: SiGraphql, level: 70 },
    ],
  },
  {
    id: "ai",
    title: "AI & Machine Learning",
    skills: [
      { name: "LLM APIs (OpenAI, Claude)", icon: SiAnthropic, level: 88 },
      { name: "Google Gemini", icon: SiGooglegemini, level: 80 },
      { name: "LangChain", icon: SiLangchain, level: 82 },
      { name: "RAG Pipelines", icon: LuBrainCircuit, level: 82 },
      { name: "Vector DBs (Pinecone, Chroma, pgvector)", icon: TbVectorTriangle, level: 78 },
      { name: "Hugging Face", icon: SiHuggingface, level: 75 },
      { name: "Ollama (local LLMs)", icon: SiOllama, level: 72 },
      { name: "PyTorch", icon: SiPytorch, level: 65 },
      { name: "TensorFlow", icon: SiTensorflow, level: 62 },
      { name: "scikit-learn", icon: SiScikitlearn, level: 72 },
      { name: "Pandas", icon: SiPandas, level: 80 },
      { name: "NumPy", icon: SiNumpy, level: 80 },
      { name: "Streamlit", icon: SiStreamlit, level: 78 },
      { name: "Jupyter", icon: SiJupyter, level: 85 },
    ],
  },
  {
    id: "database",
    title: "Database",
    skills: [
      { name: "PostgreSQL", icon: SiPostgresql, level: 76 },
      { name: "MySQL", icon: SiMysql, level: 80 },
      { name: "MongoDB", icon: SiMongodb, level: 78 },
      { name: "Redis", icon: SiRedis, level: 70 },
      { name: "Prisma ORM", icon: SiPrisma, level: 78 },
      { name: "Firebase", icon: SiFirebase, level: 75 },
      { name: "Supabase", icon: SiSupabase, level: 72 },
    ],
  },
  {
    id: "tools",
    title: "DevOps & Tools",
    skills: [
      { name: "Git", icon: FaGitAlt, level: 90 },
      { name: "GitHub", icon: FaGithub, level: 90 },
      { name: "GitHub Actions", icon: SiGithubactions, level: 75 },
      { name: "Docker", icon: SiDocker, level: 70 },
      { name: "Vercel", icon: SiVercel, level: 88 },
      { name: "Netlify", icon: SiNetlify, level: 86 },
      { name: "npm", icon: FaNpm, level: 90 },
      { name: "Linux", icon: SiLinux, level: 72 },
      { name: "VS Code", icon: VscVscode, level: 95 },
      { name: "Postman", icon: SiPostman, level: 85 },
      { name: "Figma", icon: FaFigma, level: 70 },
    ],
  },
];
