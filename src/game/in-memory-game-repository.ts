import { Uuid } from '@/global';
import { GameDetails, PersistedGameDetails } from './game-service.d';

export interface GameRepository {
    saveGame: (gameDetails: GameDetails) => Promise<PersistedGameDetails>;
}

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
}
