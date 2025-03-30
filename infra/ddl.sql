CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
    spotify_id TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'user',
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    spotify_track_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    seed_track_id INTEGER NOT NULL REFERENCES tracks(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recommendation_tracks (
    id SERIAL PRIMARY KEY,
    recommendation_id INTEGER NOT NULL REFERENCES recommendations(id),
    track_id INTEGER NOT NULL REFERENCES tracks(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    track_id INTEGER NOT NULL REFERENCES tracks(id),
    UNIQUE (user_id, track_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
