import type { ResponseFormat } from './types';

export const flashcardGenerationSchema: ResponseFormat = {
  type: 'json_object',
  schema: {
    type: 'object',
    properties: {
      flashcards: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            front: {
              type: 'string',
              description: 'The front side of the flashcard containing the question or concept'
            },
            back: {
              type: 'string',
              description: 'The back side of the flashcard containing the answer or explanation'
            }
          },
          required: ['front', 'back'],
          additionalProperties: false
        }
      }
    },
    required: ['flashcards'],
    additionalProperties: false
  }
};