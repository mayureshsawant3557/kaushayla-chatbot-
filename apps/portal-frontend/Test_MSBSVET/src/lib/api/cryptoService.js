import forge from "node-forge";

export const generateAesKey = () => {
    const key = crypto.getRandomValues(new Uint8Array(32)); // AES-256
    const iv = crypto.getRandomValues(new Uint8Array(16)); // 16-byte IV

    return { key, iv };
};

/* 🔐 AES encrypt payload */
export const aesEncrypt = (plainText, key, iv) => {

    // 🔁 Convert Uint8Array → binary string
    const keyBytes = forge.util.createBuffer(key).getBytes();
    const ivBytes = forge.util.createBuffer(iv).getBytes();

    const cipher = forge.cipher.createCipher("AES-CBC", keyBytes);

    cipher.start({ iv: ivBytes });
    cipher.update(forge.util.createBuffer(plainText, "utf8"));
    cipher.finish();

    return forge.util.encode64(cipher.output.getBytes());
};

/* 🔐 RSA Encrypt AES key / IV */
export const rsaEncryptAesKey = (uint8Array, base64PublicKey) => {
    //const pem = base64ToPem(base64PublicKey);
    const publicKey = forge.pki.publicKeyFromPem(base64PublicKey);

    const binary = forge.util.createBuffer(uint8Array).getBytes();

    const encrypted = publicKey.encrypt(binary, "RSA-OAEP", {
        md: forge.md.sha256.create()
    });

    return forge.util.encode64(encrypted);
};

export const aesDecrypt = (cipherTextBase64, key, iv) => {
    const keyBytes = forge.util.createBuffer(key).getBytes();
    const ivBytes = forge.util.createBuffer(iv).getBytes();

    const decipher = forge.cipher.createDecipher("AES-CBC", keyBytes);

    decipher.start({ iv: ivBytes });
    decipher.update(
        forge.util.createBuffer(forge.util.decode64(cipherTextBase64))
    );

    if (!decipher.finish()) {
        throw new Error("AES decrypt failed");
    }

    return decipher.output.toString("utf8");
};
