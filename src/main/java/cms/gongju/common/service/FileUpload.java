package cms.gongju.common.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileUpload {

    /**
     * 파일을 저장하고 저장된 경로를 반환합니다.
     *
     * @param file 업로드할 MultipartFile 파일
     * @throws IOException 파일 저장 실패 시 예외 발생
     */
    public void saveFile(MultipartFile file) throws IOException {
        // 저장 파일 경로 설정
        String projectRootPath = Paths.get("").toAbsolutePath().toString();
        String sep = File.separator;

        // 저장 디렉토리 설정: 프로젝트 루트의 "uploads" 폴더
        File uploadDirectory = new File(projectRootPath + sep + "uploads");
        if (!uploadDirectory.exists()) {
            uploadDirectory.mkdirs(); // 디렉토리 생성
        }

        // 고유 파일 이름 생성 (UUID 사용)
        String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        // 최종 저장 파일 경로
        String filePath = projectRootPath + sep + "uploads" + sep + uniqueFileName;

        // 파일 저장
        File dest = new File(filePath);
        file.transferTo(dest);

        System.out.println("File '" + file.getOriginalFilename() + "' saved at: " + filePath);
    }
}