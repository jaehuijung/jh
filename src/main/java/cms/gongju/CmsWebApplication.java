package cms.gongju;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;


@MapperScan
@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class CmsWebApplication {

	public static void main(String[] args) {
		SpringApplication.run(CmsWebApplication.class, args);
	}

}