package cms.gongju.cablerequest.service;

import cms.gongju.cablerequest.mapper.CableFileMapper;
import cms.gongju.cablerequest.vo.CableFileAttachVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CableFileService {

    private final CableFileMapper cableFileMapper;

    public List<Long> saveFiles(Long workDetailId, MultipartFile[] files) throws IOException {
        // 1) 프로젝트 최상위 폴더의 uploads 폴더 경로 생성

        List<Long> fileIds = new ArrayList<>();
        String projectRootPath = System.getProperty("user.dir");


        // uploads 폴더 지정
        File uploadDir = new File(projectRootPath, "uploads");
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();  // 폴더가 없으면 생성
        }

        // 2) 전달받은 MultipartFile[] 순회 저장
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;  // 업로드된 파일이 없는 경우 스킵
            }

            // (a) 원본 파일명
            String originalFilename = file.getOriginalFilename();
            String ext = "";
            if (originalFilename != null && originalFilename.lastIndexOf(".") != -1) {
                ext = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // (b) 내부 저장용 파일명(UUID)
            String uuidName = UUID.randomUUID().toString().replaceAll("-", "") + ext;

            // (c) 실제 저장될 경로
            File targetFile = new File(uploadDir, uuidName);
            file.transferTo(targetFile); // 물리 저장

            // 3) DB 저장을 위한 VO 구성
            CableFileAttachVO vo = new CableFileAttachVO();
            vo.setWorkDetailId(workDetailId);
            vo.setOrgFileName(originalFilename);
            vo.setSaveFileName(uuidName);
            vo.setFileSize(file.getSize());
            vo.setFileType(file.getContentType());
            // 파일 실제 경로를 넣을 수도 있고,
            // "uploads/uuidName" 형식의 상대경로만 DB에 저장할 수도 있음
            vo.setFilePath(targetFile.getAbsolutePath());

            vo.setRegId("admin"); // 실제 로그인 사용자 ID 사용

           // cableFileMapper.insertFileAttach(vo);
            Long fileId = cableFileMapper.insertFileAttach(vo);
            fileIds.add(fileId);
        }
        return fileIds;
    }


    public List<CableFileAttachVO> getFilesByWorkDetailId(Long workDetailId) {
        return cableFileMapper.selectFilesByWorkDetailId(workDetailId);
    }

    public void deleteFiles(List<Long> fileIds) {
        for (Long fileId : fileIds) {
            // 1. DB에서 파일 정보 조회
            CableFileAttachVO fileInfo = cableFileMapper.selectFileById(fileId);

            if (fileInfo != null) {
                // 2. 물리 파일 삭제
                String filePath = fileInfo.getFilePath();
                File file = new File(filePath);
                if (file.exists() && file.isFile()) {
                    file.delete();
                }

                // 3. DB 레코드 삭제
                cableFileMapper.deleteFileById(fileId);
            }
        }
    }

    // 파일 정보 조회 메소드 추가
    public CableFileAttachVO getFileById(Long fileId) {
        return cableFileMapper.selectFileById(fileId);
    }


}
