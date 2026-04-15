package com.library.repository;

import com.library.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // 1. Used by the Service to calculate the next sequence number
    Student findTopByOrderByIdDesc();

    // 2. Used to check for duplicate emails before registration
    Optional<Student> findByEmail(String email);

    // 3. Useful for profile lookups or search features later
    Optional<Student> findByLibraryId(String libraryId);

    // 4. Quick check exists (more efficient than fetching the whole object)
    boolean existsByEmail(String email);

    //
    // // ✅ Finds student by LIB-2026-XXXX
    // Optional<Student> findByLibraryId(String libraryId);
    
    // ✅ Checks if library_id exists
    //boolean existsByLibraryId(String libraryId);

    //
    // This forces the check using JPQL so there is no naming confusion
    @Query("SELECT (COUNT(s) > 0) FROM Student s WHERE s.libraryId = :libraryId")
    boolean existsByLibraryId(@Param("libraryId") String libraryId);

    //Optional<Student> findByLibraryId(String libraryId);
}