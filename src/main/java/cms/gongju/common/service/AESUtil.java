package cms.gongju.common.service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.util.Base64;

public class AESUtil {

    private static final String ALGORITHM = "AES";
    private static final String SAFE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final String UNSAFE_FILE_CHARACTERS = " \\ / : * ? \" < > | ";

    // AES 키 생성
    public static SecretKey generateKey() throws Exception {
        KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
        keyGenerator.init(256); // 키 크기: 128, 192, 256 중 선택 가능
        return keyGenerator.generateKey();
    }

    // 문자열 암호화
    public static String encrypt(String data, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] encryptedBytes = cipher.doFinal(data.getBytes());
        return Base64.getUrlEncoder().encodeToString(encryptedBytes);
    }

    // 문자열 복호화
    public static String decrypt(String encryptedData, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, key);
        byte[] decryptedBytes = cipher.doFinal(Base64.getUrlDecoder().decode(encryptedData));
        return new String(decryptedBytes);
    }

    // 파일 이름으로 안전한 문자열 변환
    public static String toSafeFileName(String input) {
        StringBuilder safeName = new StringBuilder();
        for (char c : input.toCharArray()) {
            if (SAFE_CHARACTERS.indexOf(c) != -1) {
                safeName.append(c);
            } else if (UNSAFE_FILE_CHARACTERS.indexOf(c) != -1) {
                safeName.append('_');
            } else {
                safeName.append(c);
            }
        }
        return safeName.toString();
    }

    // 안전한 파일 이름을 원래 문자열로 변환
    public static String fromSafeFileName(String safeFileName) {
        StringBuilder originalName = new StringBuilder();
        for (int i = 0; i < safeFileName.length(); i++) {
            char c = safeFileName.charAt(i);
            if (c == '_') {
                // '_'는 원래의 불안전한 문자로 되돌리지 않습니다.
                originalName.append('_');
            } else {
                originalName.append(c);
            }
        }
        return originalName.toString();
    }

    // 암호화
    public static String encryptWithSafeFileName(String data, SecretKey key) throws Exception {
        String encryptedData = encrypt(data, key);
        return toSafeFileName(encryptedData);
    }

    // 복호화
    public static String decryptFromSafeFileName(String safeFileName, SecretKey key) throws Exception {
        String originalEncryptedData = fromSafeFileName(safeFileName);
        return decrypt(originalEncryptedData, key);
    }
}