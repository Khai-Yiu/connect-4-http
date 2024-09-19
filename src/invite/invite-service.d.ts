import { Uuid } from '@/global';

export type InviteCreationDetails = {
    inviter: string;
    invitee: string;
};

export type InviteDetails = {
    uuid: Uuid;
    inviter: string;
    invitee: string;
    exp: number;
    status: InviteStatus;
};

export enum InviteStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED'
}

export enum InviteEvents {
    INVITATION_CREATED = 'INVITATION_CREATED'
}

export type InviteServiceEventHandler = <T extends InviteDetails>(
    message: T
) => Promise<unknown>;

export type InviteServiceEventHandlers = Record<
    InviteEvents,
    InviteServiceEventHandler
>;
