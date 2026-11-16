# Pádel

Material de una clase de arquitectura de software: una app que empieza mal
hecha y mejora commit a commit. `PLAN.md` es la hoja de ruta; `GUION.md`, el
guion de la clase.

- Cada commit es un capítulo y su diff se enseña en clase. Lleva el cambio que
  enseña, sus tests y su capítulo del guion. Nada más.
- Los comentarios del código explican el código, nunca el curso: nada de
  "capítulo N", "antes esto era..." ni "pecado". La historia va en el mensaje
  del commit y en el guion.
- Todo lo que es código va por `task` (o `make`, que lo envuelve). `make` lista
  los comandos.
- En este repo SÍ se ejecutan los e2e en local (`make test:e2e`): son la red de
  seguridad de cada refactor. Necesitan docker.
