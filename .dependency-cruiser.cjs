/**
 * "Arch-contract": regras de arquitetura impostas via dependency-cruiser.
 * Uso: npm run arch  (roda `depcruise src tests`)
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Dependências circulares dificultam testar e raciocinar sobre o módulo.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'src-must-not-import-tests',
      severity: 'error',
      comment: 'Código de produção (src/) não pode depender de código de teste (tests/).',
      from: { path: '^src' },
      to: { path: '^tests' },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment:
        'Arquivo não é importado por ninguém — pode estar morto (ver também `npm run knip`).',
      from: { orphan: true, pathNot: '\\.(test|spec)\\.js$' },
      to: {},
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: false,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
