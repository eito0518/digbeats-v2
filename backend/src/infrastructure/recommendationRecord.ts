export class RecommendationRecord {
  constructor(
    private _id: number,
    private _userId: number,
    private _seedTrackId: number,
    private _createdAt: Date
  ) {}
}
