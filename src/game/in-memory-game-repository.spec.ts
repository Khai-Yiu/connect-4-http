describe('in-memory-game-repository', () => {
    it('creates an in-memory game repository', () => {
        const repository = new InMemoryGameRepository();
        expect(repository).toBeInstanceOf(InMemoryGameRepository);
    });
});
