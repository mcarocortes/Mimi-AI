import type { PromptTemplate } from './types'

export const TEMPLATES: PromptTemplate[] = [
  {
    id: 'debug',
    category: 'Código',
    title: 'Debug de código',
    description: 'Encuentra el bug y explica el porqué',
    prompt:
      'Actúa como senior engineer. Revisa este código, localiza el bug más probable y explícalo.\n\nCódigo:\n```\n[pega el código]\n```\n\nQuiero: 1) hipótesis del error, 2) cómo reproducirlo, 3) parche concreto, 4) cómo evitarlo la próxima vez.',
  },
  {
    id: 'explain-code',
    category: 'Código',
    title: 'Explicar código',
    description: 'Deja el snippet cristalino',
    prompt:
      'Explícame este código como si fuera una code review amable. Resume qué hace, señala trampas y sugiere un nombre mejor si el actual no es claro.\n\n```\n[pega el código]\n```',
  },
  {
    id: 'summary',
    category: 'Escritura',
    title: 'Resumen de texto',
    description: 'Lo esencial, sin perder el tono',
    prompt:
      'Resume el siguiente texto para alguien ocupado. Máximo 8 viñetas. Conserva cifras, nombres y matices importantes. Al final, una frase de “si solo recuerdas una cosa”.\n\nTexto:\n[pega el texto]',
  },
  {
    id: 'email',
    category: 'Escritura',
    title: 'Email difícil',
    description: 'Claro, humano, sin ser frío',
    prompt:
      'Redacta un email sobre: [objetivo].\nAudiencia: [quién lo recibe].\nTono: profesional cercano, no corporativo vacío.\nIncluye asunto + cuerpo. Evita jerga y cierra con un siguiente paso concreto.',
  },
  {
    id: 'brainstorm',
    category: 'Ideas',
    title: 'Brainstorm',
    description: 'Opciones raras y útiles, no obvias',
    prompt:
      'Necesito ideas para: [proyecto o problema].\nDame 12 opciones agrupadas en: seguras, atrevidas y extrañas-pero-útiles.\nPara cada una: una frase de pitch y por qué podría funcionar.',
  },
  {
    id: 'plan',
    category: 'Ideas',
    title: 'Plan de acción',
    description: 'De idea vaga a pasos reales',
    prompt:
      'Convierte esto en un plan de 7 días: [meta].\nAsume que tengo 60–90 minutos al día. Cada día: objetivo, tarea única, y cómo sé que está hecho. Nada de relleno motivacional.',
  },
  {
    id: 'eli5',
    category: 'Aprender',
    title: 'Explícame fácil',
    description: 'Como a una persona lista y ocupada',
    prompt:
      'Explícame [tema] de forma clara, sin condescendencia. Estructura: analogía, cómo funciona de verdad, error común, y un mini ejemplo. Luego 3 preguntas para comprobar si lo entendí.',
  },
  {
    id: 'review-prompt',
    category: 'Aprender',
    title: 'Mejora este prompt',
    description: 'Meta: prompt engineering explícito',
    prompt:
      'Eres coach de prompts. Reescribe este prompt para que un modelo lo ejecute mejor. Devuelve: versión mejorada, qué le faltaba, y una checklist de 4 puntos para la próxima vez.\n\nPrompt original:\n[pega tu prompt]',
  },
]
