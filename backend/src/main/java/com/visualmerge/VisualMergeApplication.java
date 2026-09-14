package com.visualmerge;

import com.visualmerge.config.WorkspaceProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(WorkspaceProperties.class)
public class VisualMergeApplication {

    public static void main(String[] args) {
        SpringApplication.run(VisualMergeApplication.class, args);
    }
}
