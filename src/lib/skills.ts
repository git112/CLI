import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as clack from '@clack/prompts';

const execAsync = promisify(exec);

export async function installSkills(json: boolean): Promise<void> {
  try {
    if (!json) clack.log.info('Installing InsForge agent skills...');
    await execAsync('npx skills add insforge/agent-skills -y -a antigravity -a augment -a claude-code -a cline -a codex -a cursor -a gemini-cli -a github-copilot -a kilo -a qoder -a qwen-code -a roo -a trae -a windsurf', {
      cwd: process.cwd(),
      timeout: 60_000,
    });
    if (!json) clack.log.success('InsForge agent skills installed.');
  } catch {
    if (!json) clack.log.warn('Failed to install agent skills. You can run manually: npx skills add insforge/agent-skills');
  }
}
