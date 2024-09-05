import { Uuid } from '@/global';
import { GameDetails, PersistedGameDetails } from './game-types.d';

export interface GameRepository {
    saveGame: (gameDetails: GameDetails) => Promise<PersistedGameDetails>;
    loadGame: (gameUuid: Uuid) => Promise<PersistedGameDetails>;
}

export class NoSuchGameError extends Error {}

export default class InMemoryGameRepository implements GameRepository {
    games: Map<Uuid, PersistedGameDetails>;

    constructor() {
        this.games = new Map();
    }

    async saveGame(gameDetails: GameDetails) {
        const uuid = crypto.randomUUID();
        const persistedGameDetails = {
            uuid,
            ...gameDetails
        };
        this.games.set(uuid, persistedGameDetails);

        return persistedGameDetails;
    }

    async loadGame(gameUuid: Uuid) {
        const game = this.games.get(gameUuid);

        if (game === undefined) {
            throw new NoSuchGameError();
        }

        return game;
    }
}
