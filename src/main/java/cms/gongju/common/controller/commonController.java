package cms.gongju.common.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*") /* CORS 어노테이션 */
@Controller
@RequestMapping("/common")
public class commonController {

    @ResponseBody
    @GetMapping("/qrImage/{filename}")
    public ResponseEntity<Resource> serveFile(@PathVariable("filename") String filename) {
        try {
            // 프로젝트 루트 경로를 기준으로 파일 경로 생성
            String sep = File.separator;
            String projectRootPath = Paths.get("").toAbsolutePath().toString();
            Path filePath = Paths.get(projectRootPath + sep + "qr").resolve(filename).normalize();

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                // 파일이 존재하지 않거나 읽을 수 없을 때
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            // 예외 발생 시
            return ResponseEntity.status(500).build();
        }
    }

}
