export type InviteCreationDetails = {
    inviter: String;
    invitee: String;
};

export type InviteDetails = {
    uuid: String;
    inviter: String;
    invitee: String;
    exp: number;
    status: InviteStatus;
};

export enum InviteStatus {
    PENDING = 'PENDING'
}
