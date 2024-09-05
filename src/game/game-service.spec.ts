import InMemoryGameRepository, {
    GameRepository
} from './in-memory-game-repository';
import Game from './game';

describe('game-service', () => {
    let gameRepository: GameRepository;
    let gameService: GameService;

    beforeEach(() => {
        gameRepository = new InMemoryGameRepository();
        gameService = new gameService(
            gameRepository,
            (...args: ConstructorParameters<typeof Game>) => new Game(...args)
        );
    });
    describe('creating a game service', () => {
        describe('given a game repository', () => {
            describe('and a game constructor', () => {
                it('creates a game service', () => {
                    const gameRepository = new InMemoryGameRepository();
                    const gameService = new gameService(
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
