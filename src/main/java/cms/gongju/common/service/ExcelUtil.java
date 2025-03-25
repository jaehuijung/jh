package cms.gongju.common.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ExcelUtil
{

    // BASE_PATH를 상수로 선언
    private static final String BASE_PATH = System.getProperty("user.dir")
            + File.separator + "src" + File.separator + "main" + File.separator + "resources"
            + File.separator + "static" + File.separator;

    private ExcelUtil() {
        // 유틸리티 클래스이므로 인스턴스화를 방지
    }

    /**
     * 파일 경로 반환 (템플릿 파일)
     *
     * @param fileName 엑셀 템플릿 파일 이름
     * @return 파일 경로
     */
    public static String getExcelTemplatePath(String fileName) {
        return BASE_PATH + "excelTemplate" + File.separator + fileName;
    }

    /**
     * 파일에서 Workbook 객체 생성
     *
     * @param fileName 엑셀 템플릿 파일 이름
     * @return Workbook 객체
     * @throws IOException 파일 읽기 오류 발생 시
     */
    public static Workbook getWorkbookFromTemplate(String fileName) throws IOException {
        String filePath = getExcelTemplatePath(fileName);
        try (FileInputStream fileInputStream = new FileInputStream(filePath)) {
            return new XSSFWorkbook(fileInputStream);
        }
    }

    /**
     * 데이터를 사용해 엑셀 시트에 작성
     *
     * @param workbook 엑셀 워크북 객체
     * @param sheetName 시트 이름
     * @param data 엑셀에 작성할 데이터
     */
    public static void writeDataToSheet(Workbook workbook, String sheetName, List<Map<String, Object>> data) {
        if (data == null || data.isEmpty() || workbook == null) {
            throw new IllegalArgumentException("Data or Workbook is null/empty");
        }

        // 시트 가져오기 또는 생성
        Sheet sheet = workbook.getSheet(sheetName);
        if (sheet == null) {
            sheet = workbook.createSheet(sheetName);
        }

        // 헤더 작성
        Map<String, Object> firstRow = data.get(0);
        int headerRowIndex = 0;
        Row headerRow = sheet.createRow(headerRowIndex);

        int colIndex = 0;
        List<String> columnKeys = new ArrayList<>(firstRow.keySet());
        for (String key : columnKeys) {
            Cell cell = headerRow.createCell(colIndex++);
            cell.setCellValue(key); // 키를 헤더로 사용
            cell.setCellStyle(getHeaderCellStyle(workbook)); // 헤더 스타일 적용
        }

        // 데이터 작성
        int rowIndex = 1; // 데이터는 헤더 아래부터 작성
        for (Map<String, Object> rowData : data) {
            Row row = sheet.createRow(rowIndex++);
            int cellIndex = 0;

            for (String key : columnKeys) {
                Cell cell = row.createCell(cellIndex++);
                Object value = rowData.get(key);
                setCellValue(cell, value); // 값 설정
            }
        }

        // 열 너비 자동 조정
        for (int i = 0; i < columnKeys.size(); i++) {
            sheet.autoSizeColumn(i);
        }
    }

    /**
     * 셀에 적절한 데이터 값 작성
     *
     * @param cell 셀 객체
     * @param value 값 객체
     */
    private static void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else {
            cell.setCellValue(value.toString());
        }
    }

    /**
     * 엑셀 헤더 스타일 (예: Bold 처리)
     *
     * @param workbook 워크북 객체
     * @return 셀 스타일
     */
    private static CellStyle getHeaderCellStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }


}

