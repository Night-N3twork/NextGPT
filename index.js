import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import http from "http";
import path from "path";
import chalk from "chalk";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
const __dirname = process.cwd();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  // Send your frontend's index.html file
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/gpt', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      prompt: `${prompt}`,
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    res.status(200).send({
      bot: response.data.choices[0].text
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});

const server = app.listen(PORT, () => {
  const address = server.address();
  const theme = chalk.hex("#D91E56");
  const host = chalk.hex("0d52bd");

  console.log(chalk.bold(theme(`
███╗   ██╗███████╗██╗  ██╗████████╗ ██████╗ ██████╗ ████████╗
████╗  ██║██╔════╝╚██╗██╔╝╚══██╔══╝██╔════╝ ██╔══██╗╚══██╔══╝
██╔██╗ ██║█████╗   ╚███╔╝    ██║   ██║  ███╗██████╔╝   ██║   
██║╚██╗██║██╔══╝   ██╔██╗    ██║   ██║   ██║██╔═══╝    ██║   
██║ ╚████║███████╗██╔╝ ██╗   ██║   ╚██████╔╝██║        ██║   
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝        ╚═╝   
                                                             `)));

  console.log(`  ${chalk.bold(host("Local System:"))}            http://localhost:${chalk.bold(address.port)}`);

  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    console.log(`  ${chalk.bold(host("Replit:"))}           https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
  }

  if (process.env.HOSTNAME && process.env.GITPOD_WORKSPACE_CLUSTER_HOST) {
    console.log(`  ${chalk.bold(host("Gitpod:"))}           https://${PORT}-${process.env.HOSTNAME}.${process.env.GITPOD_WORKSPACE_CLUSTER_HOST}`);
  }

  if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
    console.log(`  ${chalk.bold(host("Github Codespaces:"))}           https://${process.env.CODESPACE_NAME}-${address.port}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`);
  }
});

// Handle shutdown gracefully
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
}
