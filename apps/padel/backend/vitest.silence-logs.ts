import { Logger } from '@nestjs/common';

// Los handlers escriben en el logger de Nest; sin app que lo configure, saldria
// por consola en mitad de la salida de los tests.
Logger.overrideLogger(false);
