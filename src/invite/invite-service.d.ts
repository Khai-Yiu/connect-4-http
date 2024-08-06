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
