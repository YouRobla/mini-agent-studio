import { Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { DATABASE, databaseProvider } from './database.provider.js';

/**
 * Dueño de la conexión a SQLite: la abre al arrancar, la comparte con los
 * módulos que lo importan y la cierra cuando la aplicación se detiene.
 */
@Module({
  providers: [databaseProvider],
  exports: [DATABASE],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(DATABASE) private readonly db: DatabaseSync) {}

  onModuleDestroy(): void {
    if (this.db.isOpen) this.db.close();
  }
}
