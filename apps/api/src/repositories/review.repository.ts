import BaseRepository from "./base.repository";
import { review } from "../models/review.model";

export class ReviewRepository extends BaseRepository<typeof review> {
  constructor() {
    super(review, review.id);
  }
}

export const reviewRepository = new ReviewRepository();
