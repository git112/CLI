import { Command } from 'commander';
import { ossFetch } from '../../lib/api/oss.js';
import { requireAuth } from '../../lib/credentials.js';
import { handleError, getRootOpts } from '../../lib/errors.js';
import { outputJson } from '../../lib/output.js';

export function registerFunctionsInvokeCommand(functionsCmd: Command): void {
  functionsCmd
    .command('invoke <slug>')
    .description('Invoke an edge function')
    .option('--data <json>', 'JSON body to send to the function')
    .option('--method <method>', 'HTTP method (GET, POST, PUT, PATCH, DELETE)', 'POST')
    .action(async (slug: string, opts, cmd) => {
      const { json } = getRootOpts(cmd);
      try {
        requireAuth();

        const method = opts.method.toUpperCase();
        const fetchOpts: RequestInit = { method };

        if (opts.data && ['POST', 'PUT', 'PATCH'].includes(method)) {
          fetchOpts.body = opts.data;
        }

        // Functions client endpoint is at /functions/{slug} (not /api/functions/{slug})
        const res = await ossFetch(`/functions/${encodeURIComponent(slug)}`, fetchOpts);

        const contentType = res.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (json) {
            outputJson(data);
          } else {
            console.log(JSON.stringify(data, null, 2));
          }
        } else {
          const text = await res.text();
          console.log(text);
        }
      } catch (err) {
        handleError(err, json);
      }
    });
}
