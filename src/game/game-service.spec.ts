import InMemoryGameRepository, {
    GameRepository
} from '@/game/in-memory-game-repository';
import Game from '@/game/game';
import GameService from '@/game/game-service';

describe('game-service', () => {
    let gameRepository: GameRepository;
    let gameService: GameService;

    beforeEach(() => {
        gameRepository = new InMemoryGameRepository();
        gameService = new GameService(
            gameRepository,
            (...args: ConstructorParameters<typeof Game>) => new Game(...args)
        );
    });
    describe('creating a game service', () => {
        describe('given a game repository', () => {
            describe('and a game constructor', () => {
                it('creates a game service', () => {
                    const gameRepository = new InMemoryGameRepository();
                    const gameService = new GameService(
                        gameRepository,
                        (...args: ConstructorParameters<typeof Game>) =>
                            new Game(...args)
                    );

                    expect(gameService).toBeInstanceOf(GameService);
                });
            });
        });
    });
});
