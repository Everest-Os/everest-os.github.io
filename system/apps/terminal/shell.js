/**
 * Shell - Command execution engine for the playground terminal.
 */
export class Shell {
  constructor(ctx) {
    this.ctx = ctx;
    this.cwd = '/home/user';
    this.env = {
      USER: 'user',
      HOME: '/home/user',
      PATH: '/bin:/usr/bin',
      SHELL: 'psh'
    };
    this.history = [];
    this.commands = new Map();
  }

  /**
   * Register a command
   */
  register(name, handler) {
    this.commands.set(name, handler);
  }

  /**
   * Resolve an absolute path from a relative path
   */
  resolve(path) {
    if (!path) return this.cwd;
    if (path.startsWith('/')) return this.ctx.vfs.resolvePath(path);
    if (path.startsWith('~')) return this.ctx.vfs.resolvePath(path);
    return this.ctx.vfs.resolvePath(`${this.cwd}/${path}`);
  }

  /**
   * Execute a command string
   */
  async execute(line, stdout) {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 0 || parts[0] === '') return;

    const cmdName = parts[0];
    const args = parts.slice(1);

    this.history.push(line);

    const command = this.commands.get(cmdName);
    if (command) {
      try {
        await command(args, {
          shell: this,
          stdout,
          vfs: this.ctx.vfs,
          ctx: this.ctx
        });
      } catch (e) {
        stdout.write(`\r\n\x1b[31mError: ${e.message}\x1b[0m\r\n`);
      }
    } else {
      stdout.write(`\r\npsh: command not found: ${cmdName}\r\n`);
    }
  }
}
