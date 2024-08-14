import { ServiceEventHandler } from '@/app.d';

const dummyEventHandler: ServiceEventHandler = () =>
    Promise.resolve(true) as ServiceEventHandler;
