import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

export interface UserPayload {
    username: string;
    role: "customer" | "admin";
    lastName?: string;
    firstName?: string;
    accessLevel?: "full" | "limited" | "view only";
    defaultPassword: boolean;
}

interface RefreshTokenPayload {
    user_id: number;
    iat: number;
    jti: string;
}

type StringValue = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;

export const generateToken = (payload: object, expiresIn: StringValue) => {
    const token = jwt.sign(payload, secret, { expiresIn });

    return token;
};

export const generateAccessToken = (payload: object) => {
    console.log("generating:");
    return generateToken(payload, "1h");
};

export const generateRefreshToken = (payload: object) => {
    return generateToken(payload, "7d");
};

export const verifyToken = (token: string): UserPayload | undefined => {
    try {
        const decoded = jwt.verify(token, secret) as UserPayload;
        return decoded;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const verifyRefreshToken = (
    refreshToken: string
): RefreshTokenPayload | undefined => {
    try {
        const decoded = jwt.verify(refreshToken, secret) as RefreshTokenPayload;
        return decoded;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};
