package com.civicfix;

import com.civicfix.service.AnalyticsAndDataIntegrityTest;
import com.civicfix.service.DuplicateDetectionServiceTest;
import com.civicfix.service.PriorityScoringServiceTest;
import com.civicfix.service.ReferenceIdGenerationTest;
import com.civicfix.service.RoleAndRegistrationSecurityTest;
import com.civicfix.service.WorkflowTransitionTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.List;

public class TestRunner {

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("   CIVICFIX AUTOMATED TEST SUITE EXECUTION       ");
        System.out.println("=================================================");

        List<Class<?>> testClasses = List.of(
                PriorityScoringServiceTest.class,
                WorkflowTransitionTest.class,
                DuplicateDetectionServiceTest.class,
                ReferenceIdGenerationTest.class,
                RoleAndRegistrationSecurityTest.class,
                AnalyticsAndDataIntegrityTest.class
        );

        int passed = 0;
        int failed = 0;

        for (Class<?> testClass : testClasses) {
            System.out.println("\nRunning Test Class: " + testClass.getSimpleName());
            try {
                Object instance = testClass.getDeclaredConstructor().newInstance();
                Method setUpMethod = null;

                for (Method m : testClass.getDeclaredMethods()) {
                    if (m.isAnnotationPresent(BeforeEach.class)) {
                        setUpMethod = m;
                        break;
                    }
                }

                for (Method method : testClass.getDeclaredMethods()) {
                    if (method.isAnnotationPresent(Test.class)) {
                        DisplayName displayName = method.getAnnotation(DisplayName.class);
                        String testName = displayName != null ? displayName.value() : method.getName();

                        try {
                            if (setUpMethod != null) {
                                setUpMethod.setAccessible(true);
                                setUpMethod.invoke(instance);
                            }

                            method.setAccessible(true);
                            method.invoke(instance);
                            System.out.printf("  [PASS] %s%n", testName);
                            passed++;
                        } catch (Exception e) {
                            System.err.printf("  [FAIL] %s: %s%n", testName, e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
                            failed++;
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Could not instantiate " + testClass.getName() + ": " + e.getMessage());
                failed++;
            }
        }

        System.out.println("\n-------------------------------------------------");
        System.out.printf("RESULTS: Passed: %d, Failed: %d, Total: %d%n", passed, failed, passed + failed);
        System.out.println("=================================================");

        if (failed > 0) {
            System.exit(1);
        }
    }
}
