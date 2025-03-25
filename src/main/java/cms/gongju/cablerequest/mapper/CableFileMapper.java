package cms.gongju.cablerequest.mapper;

import cms.gongju.cablerequest.vo.CableFileAttachVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CableFileMapper {
    Long insertFileAttach(CableFileAttachVO fileVO);
    List<CableFileAttachVO> selectFilesByWorkDetailId(Long workDetailId);
    CableFileAttachVO selectFileById(Long fileId);
    void deleteFileById(Long fileId);
}

