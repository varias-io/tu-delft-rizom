// generate-migration.js
import { exec } from 'child_process';
const migrationName = process.argv[2];

if (!migrationName) {
    console.error('Please provide a migration name.');
    process.exit(1);
}

const command = `npx typeorm migration:generate -d dist/utils/data-source.js src/migrations/${migrationName}`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
