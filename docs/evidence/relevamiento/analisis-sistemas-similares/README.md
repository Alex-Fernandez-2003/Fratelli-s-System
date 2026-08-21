# Método 3 — Análisis de sistemas similares / benchmarking

## 1. Técnica

El proyecto utiliza **análisis de sistemas similares / benchmarking funcional** como tercera técnica de investigación y contraste.

## 2. Artefacto principal

```text
analisis-sistemas-similares.md
```

El documento analiza seis referencias del dominio gastronómico y compara patrones relacionados con ventas, pedidos, cocina, inventario, compras, caja, personal, reportes y otras capacidades.

## 3. Objetivo

Obtener otros puntos de vista sobre cómo sistemas reales de restaurantes estructuran problemas equivalentes y utilizar esos patrones para:

- contrastar el Product Backlog;
- detectar alternativas;
- formular mejores preguntas;
- reconocer posibles evoluciones futuras;
- evitar que el diseño dependa únicamente de la experiencia interna observada en Fratelli.

## 4. Regla de uso

Una función encontrada en otro producto **no se transforma automáticamente en requisito**.

```text
Patrón externo
   ↓
Referencia / pregunta
   ↓
Contraste con Fratelli
   ↓
Solo si existe evidencia → requisito/regla
```

Las reglas de negocio de Fratelli se sustentan prioritariamente en evidencia directa del negocio.

## 5. Estado

**Aplicado y contrastado.**

El análisis fue revisado el 21/08/2026 y su sección de HU se actualizó después de `ENT-02` para distinguir claramente el aporte del benchmarking frente a la evidencia directa de la entrevista.
