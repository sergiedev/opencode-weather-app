# Revisión Weather CLI

- [x] **Colores:** no hay ninguno; falta definir cyan (menú), amarillo (temp), verde/rojo (ok/error).
- [x] **AGENTS.md:** dice que `index.ts` es stub, pero la app ya funciona — hay que actualizarlo.
- [x] **Ciudades:** geocoding solo trae 1 resultado; nombres ambiguos pueden fallar.
- [x] **Tests:** no existen; conviene al menos probar storage y las APIs con mocks.
- [x] **Binario:** compila bien; revisar que `./weather` guarde datos en `~/.config/weather- cli/`.
- [x] **Escalabilidad:** ¿qué tan fácil será expandir con nuevas funcionalidades?
- [x] **Carga:** ¿hay estado de carga en las tareas asíncronas?
- [x] **7 day forecast** agregar ña ´psibilidad de obtener el pronostico del clima para los proximos 7 dias.