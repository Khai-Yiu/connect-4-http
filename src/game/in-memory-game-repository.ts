import { Uuid } from '@/global';
import { GameDetails, PersistedGameDetails } from '@/game/game-types.d';

export interface GameRepository {
    saveGame: (gameDetails: GameDetails) => Promise<PersistedGameDetails>;
    loadGame: (gameUuid: Uuid) => Promise<PersistedGameDetails>;
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
        this.games.set(persistedGameDetails.uuid, persistedGameDetails);

        return persistedGameDetails;
    }

    async loadGame(gameUuid: Uuid) {
        return this.games.get(gameUuid);
    }
}
