package com.visualmerge.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The frontend runs on a different origin in development, so every method the
 * UI calls has to survive the CORS filter.
 *
 * <p>Regression: DELETE was missing from the allowed methods, so disconnecting
 * a repository was rejected with 403 and its workspace was never freed.
 */
@SpringBootTest
@TestPropertySource(properties = "visualmerge.workspace.cleanup-on-shutdown=false")
class RepositoryControllerCorsTest {

    private static final String ORIGIN = "http://localhost:5173";

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc() {
        return MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void allowsTheFrontendOriginToDeleteARepository() throws Exception {
        // Unknown id, so this must be a 404 from the controller — never a 403 from CORS.
        mockMvc().perform(delete("/api/repositories/repo_doesnotexist").header("Origin", ORIGIN))
                .andExpect(status().isNotFound())
                .andExpect(header().string("Access-Control-Allow-Origin", ORIGIN));
    }

    @Test
    void preflightAdvertisesEveryMethodTheFrontendUses() throws Exception {
        for (String method : new String[] {"GET", "POST", "DELETE"}) {
            mockMvc().perform(options("/api/repositories/repo_any")
                            .header("Origin", ORIGIN)
                            .header("Access-Control-Request-Method", method))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", ORIGIN));
        }
    }

    @Test
    void rejectsAnUnknownOrigin() throws Exception {
        mockMvc().perform(options("/api/repositories")
                        .header("Origin", "https://evil.example")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }

    @Test
    void invalidUrlsAreRejectedBeforeAnyCloneHappens() throws Exception {
        mockMvc().perform(post("/api/repositories")
                        .header("Origin", ORIGIN)
                        .contentType("application/json")
                        .content("{\"url\":\"https://gitlab.com/foo/bar\"}"))
                .andExpect(status().isBadRequest());
    }
}
