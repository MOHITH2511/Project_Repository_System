import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class TempPasswordHash {
  public static void main(String[] args) {
    System.out.println(new BCryptPasswordEncoder().encode("password"));
  }
}
