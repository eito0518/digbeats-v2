export class TracksRecord {
  constructor(
    private _trackName: string,
    private _artistName: string,
    private _previewUrl: string,
    private _albumImage: string,
    private _artistImage: string,
    private _spotifyTrackId: string,
    private _createdAt: Date
  ) {}

  get spotifyTrackId() {
    return this._spotifyTrackId;
  }
}
