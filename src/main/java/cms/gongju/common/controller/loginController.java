package cms.gongju.common.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.*;


@CrossOrigin(origins = "*", allowedHeaders = "*") /* CORS 어노테이션 */
@Controller
public class loginController {

	public loginController() {
	}

	/**
	 * @brief 로그인 페이지 이동
	 * @details 로그인 페이지로 이동한다.
	 * @return String
	 */
	@GetMapping("/login")
	public String userLogin() {

		return "views/login/view";
	}

	/**
	 * 크롬 파일 다운로드
	 *
	 * @param response HTTP 응답 객체
	 */
	@PostMapping("/setupDownload")
	@ResponseBody
	public void downloadExeFile(HttpServletResponse response) throws IOException {
		// 서버에 있는 EXE 파일의 경로
		String filePath = System.getProperty("user.dir")
				+ File.separator + "src" + File.separator + "main" + File.separator + "resources"
				+ File.separator + "static" + File.separator + "setup" + File.separator + "ChromeSetup.exe";
		File file = new File(filePath);

		// 파일이 존재하는지 확인
		if (!file.exists()) {
			throw new FileNotFoundException("파일이 존재하지 않습니다: " + filePath);
		}

		// Content-Type 및 헤더 설정
		response.setContentType("application/octet-stream");
		response.setHeader("Content-Disposition", "attachment;filename=" + file.getName());
		response.setContentLength((int) file.length());

		// 파일을 응답 스트림에 작성
		try (FileInputStream fis = new FileInputStream(file);
			 OutputStream os = response.getOutputStream()) {
			byte[] buffer = new byte[4096];
			int bytesRead;

			while ((bytesRead = fis.read(buffer)) != -1) {
				os.write(buffer, 0, bytesRead);
			}

			os.flush();
		}
	}

}
