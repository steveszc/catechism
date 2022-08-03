import Route from '@ember/routing/route';
import { getQuestion } from 'catechesis/data';

import type { CatechismRouteModel } from 'catechesis/routes/catechism';
import type QuestionController from 'catechesis/controllers/catechism/question';

type Resolved<P> = P extends Promise<infer T> ? T : P;
export type QuestionRouteModel = Resolved<ReturnType<QuestionRoute['model']>>;

interface Params {
  question: string;
}

export default class QuestionRoute extends Route {
  async model({ question }: Params) {
    const catechism = this.modelFor('catechism') as CatechismRouteModel;
    const questionNumber = parseInt(question, 10);

    const questions = await Promise.allSettled([
      getQuestion(catechism, questionNumber - 1),
      getQuestion(catechism, questionNumber),
      getQuestion(catechism, questionNumber + 1),
    ]);

    const [previous, current, next] = questions.map((result) =>
      result.status === 'fulfilled' ? result.value : undefined
    );

    if (!current) throw new Error('404');

    return { catechism, previous, current, next };
  }

  resetController(controller: QuestionController) {
    controller.isAnswerShown = false;
  }
}
