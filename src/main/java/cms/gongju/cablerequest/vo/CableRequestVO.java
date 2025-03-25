package cms.gongju.cablerequest.vo;

import lombok.Data;

import java.util.Date;

/**
 * TB_CABLE_REQUEST 테이블 매핑 VO
 */
@Data
public class CableRequestVO {
    private Long requestId;         // REQUEST_ID
    private String requestType;    // 'INSTALL' or 'REMOVE' 구분
    private String orgName;         // 기관명
    private String deptName;        // 부서명
    private String positionTitle;   // 직급(직책)
    private String officerName;     // 주무관명
    private String workPurpose;     // 작업목적
    private String workDateType;    // 작업일자구분(D,R...)
    private Date workStartDate;     // 작업시작일
    private Date workEndDate;       // 작업종료일
    private String approvalStatus;  // 승인상태(대기,승인,반려 등)
    private String approverId;      // 승인자ID
    private Date approvalDt;        // 승인일시
    private String approvalRemarks; // 승인/반려 코멘트
    private String delYn;           // 삭제여부
    private String regId;           // 등록자
    private Date regDt;             // 등록일시
    private String updId;           // 수정자
    private Date updDt;             // 수정일시
    private String contact; // => SELECT에서 "officer_contact AS contact"
}
