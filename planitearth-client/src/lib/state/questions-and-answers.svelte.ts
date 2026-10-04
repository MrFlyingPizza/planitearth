import { questionTexts } from "./question-texts";

export type ResponseKey = keyof typeof questionTexts;
export type QuestionResponse = {
  question: string;
  answer: string;
};
export type QuestionResponses = Partial<Record<ResponseKey, QuestionResponse>>;

export function createQuestionResponses() {
  const responses = $state<QuestionResponses>({});

  return {
    get(key: ResponseKey): QuestionResponse | undefined {
      return responses[key];
    },
    set(key: ResponseKey, answer: string) {
      responses[key] = { question: questionTexts[key], answer };
    },
    get all(): Readonly<QuestionResponses> {
      return responses;
    },
  };
}
