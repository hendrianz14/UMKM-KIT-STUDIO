
export const dataUrlToBlob = (dataUrl: string): { base64Data: string; mimeType: string } => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!mimeType || !base64Data) {
        throw new Error('Invalid data URL');
    }
    return { base64Data, mimeType };
};
