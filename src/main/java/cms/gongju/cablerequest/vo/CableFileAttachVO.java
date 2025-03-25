package cms.gongju.cablerequest.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CableFileAttachVO {
    private Long fileId;
    private Long workDetailId;

    private String orgFileName;
    private String saveFileName;
    private Long fileSize;
    private String fileType;
    private String filePath;

    private String regId;
    private LocalDateTime regDt;
    private String updId;
    private LocalDateTime updDt;
}