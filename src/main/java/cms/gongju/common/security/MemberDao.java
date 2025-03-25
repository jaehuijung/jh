package cms.gongju.common.security;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@RequiredArgsConstructor
public class MemberDao {
    private String userId;         // 아이디
    private String userPwd;        // 비밀번호
    private String groupId;        // 그룹
    private String userName;       // 이름
    private String jobTitle;       // 직책
    private String deptName;       // 부서
    private String contact;        // 연락처
    private String allowedIps;     // 허용 아이피
    private String firstPage;      // 접속 페이지
    private String ntopsId;        // ntops 아이디
    private String isDeleted;      // 삭제여부
    private String regId;          // 등록한사람
    private String regDt;          // 등록일자
    private String updId;          // 마지막 수정한사람
    private String updDt;          // 마지막 수정일자
    private List<Map<String, String>> authList;
    //private List<Map<String, Object>> menuList;
}
