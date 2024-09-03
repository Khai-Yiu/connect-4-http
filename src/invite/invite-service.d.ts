export type InviteCreationDetails = {
    inviter: string;
    invitee: string;
};

export type InviteDetails = {
    uuid: string;
    inviter: string;
    invitee: string;
    exp: number;
    status: InviteStatus;
};

export enum InviteStatus {
    PENDING = 'PENDING'
}

export enum InviteEvents {
    INVITATION_CREATED = 'INVITATION_CREATED'
}

export type InviteServiceEventPublisher = <T extends InviteDetails>(
    message: T
) => Promise<unknown>;

export type InviteServiceEventPublishers = Record<
    InviteEvents,
    InviteServiceEventPublisher
>;
