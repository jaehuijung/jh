package cms.gongju.cablerequest.controller;

import cms.gongju.cablerequest.service.CableFileService;
import cms.gongju.cablerequest.vo.CableFileAttachVO;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cable/file")
public class CableFileController {

    private final CableFileService cableFileService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadLossTestFile(
            @RequestParam("workDetailId") Long workDetailId,
            @RequestParam("files") MultipartFile[] files
    ) {
        try {
            List<Long> fileIds = cableFileService.saveFiles(workDetailId, files);
            return ResponseEntity.ok(Map.of(
                    "result", "SUCCESS",
                    "fileId", fileIds.get(0)  // 첫 번째 파일 ID 반환
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("파일 업로드 실패");
        }
    }


    @GetMapping("/list/{workDetailId}")
    public ResponseEntity<?> getFileList(@PathVariable("workDetailId") Long workDetailId) {
        try {
            List<CableFileAttachVO> files = cableFileService.getFilesByWorkDetailId(workDetailId);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("파일 목록 조회 실패");
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteFiles(@RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> fileIds = request.get("fileIds");
            cableFileService.deleteFiles(fileIds);
            return ResponseEntity.ok("SUCCESS");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("파일 삭제 실패");
        }
    }

    // 파일 다운로드 API 추가
    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable("fileId") Long fileId) {
        try {
            // 파일 정보 조회
            CableFileAttachVO fileInfo = cableFileService.getFileById(fileId);
            if (fileInfo == null) {
                return ResponseEntity.notFound().build();
            }

            // 물리 파일 경로
            Path filePath = Paths.get(fileInfo.getFilePath());
            Resource resource = new FileSystemResource(filePath.toFile());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // 다운로드 응답 헤더 설정
            String encodedFileName = URLEncoder.encode(fileInfo.getOrgFileName(), StandardCharsets.UTF_8.name())
                    .replaceAll("\\+", "%20");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFileName)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(resource.contentLength()))
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
