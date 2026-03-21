import BaseRepository from "./base.repository";
import { reviewer } from "../models/reviewer.model";

export class ReviewerRepository extends BaseRepository<typeof reviewer> {
  constructor() {
    super(reviewer, reviewer.id);
  }
}

export const reviewerRepository = new ReviewerRepository();
