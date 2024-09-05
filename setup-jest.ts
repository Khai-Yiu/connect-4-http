import toBeUuid from './src/to-be-uuid';
import toBeDeeplyUnequal from './src/utils/to-be-deeply-unequal';

expect.extend({
    toBeUuid,
    toBeDeeplyUnequal
});
